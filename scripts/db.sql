drop function get_posts;
drop function get_comments;
drop function get_predictions;

drop view posts_function_return; 
drop view pred_function_return;
drop view comments_function_return;

drop view profile_view;
drop view post_view;
drop view prediction_view;
drop view comment_view;

drop function trend_score;

drop trigger manual_closed_post_trigger on post;
drop function handle_manual_closed_post;

drop function process_notifications;
drop function partition_rows;
drop function send_notifications_to_expo;
drop function handle_post;

-- util functions

create function trend_score(num_likes integer, num_dislikes integer, num_comments integer, ts timestamp with time zone, is_featured boolean) 
returns float
language plpgsql
as $$
declare 
   age_in_weeks float;
   age_multiplier float;
   base_score float;
begin
  age_in_weeks = EXTRACT(EPOCH FROM current_timestamp - ts) / (3600 * 24 * 7);
  if age_in_weeks > 1 then
    age_multiplier = EXP( -0.05 * (age_in_weeks - 1) * (age_in_weeks - 1));
  else
    age_multiplier = 1.0;
  end if;

  base_score = 10 * num_likes;
  base_score = base_score + 20 * num_comments;
  base_score = base_score * age_multiplier;
  base_score = base_score - 6 * num_dislikes;

  if is_featured then
    base_score = base_score + 10 * 10000 * 10000;
  end if;

  return base_score;
end
$$;

-- MAIN VIEWS

CREATE VIEW prediction_view AS 
SELECT *,
trend_score(num_likes, num_dislikes, num_comments, created_at, false)
FROM (
SELECT 
    p.*,
    u.username,
    u.avatar_url,
    u.verified as verified_user,
    (SELECT COUNT(1)::integer FROM prediction_like l WHERE l.prediction_id = p.id AND l.is_up = true) as num_likes,
    (SELECT COUNT(1)::integer FROM prediction_like l WHERE l.prediction_id = p.id AND l.is_up = false) as num_dislikes,
    (SELECT COUNT(1)::integer FROM comment c WHERE c.parent_prediction = p.id) as num_comments
FROM prediction p
LEFT JOIN profile u ON u.id = p.user_id 
) v;

CREATE VIEW post_view AS 
SELECT *,
trend_score(num_likes, num_dislikes, num_comments, created_at, is_featured)
FROM (
SELECT 
    p.*,
    u.username,
    u.avatar_url,
    u.verified as verified_user,
    (SELECT COUNT(1)::integer FROM post_like l WHERE l.post_id = p.id and l.is_up = true) as num_likes,
    (SELECT COUNT(1)::integer FROM post_like l WHERE l.post_id = p.id and l.is_up = false) as num_dislikes,
    (
      (SELECT COUNT(1)::integer FROM comment c WHERE c.parent_post = p.id) + 
      (SELECT COALESCE(SUM(num_comments), 0)::integer FROM prediction_view WHERE post_id = p.id)
    ) as num_comments,
    (SELECT COUNT(1)::integer FROM prediction WHERE post_id = p.id) as num_predictions
FROM post p
LEFT JOIN profile u ON u.id = p.user_id 
) v;

CREATE VIEW comment_view AS 
SELECT *,
trend_score(num_likes, num_dislikes, 0::integer, created_at, false)
FROM (
SELECT 
    c.*,
    u.username,
    u.avatar_url,
    u.verified as verified_user,
    (SELECT COUNT(1)::integer FROM comment_like l WHERE l.comment_id = c.id and l.is_up = true) as num_likes,
    (SELECT COUNT(1)::integer FROM comment_like l WHERE l.comment_id = c.id and l.is_up = false) as num_dislikes,
    0 as num_comments
FROM comment c
LEFT JOIN profile u ON u.id = c.user_id 
) v;

CREATE VIEW profile_view AS 
WITH
  post_likes AS (
    SELECT
      SUM(num_likes) AS num_likes,
      SUM(num_dislikes) AS num_dislikes,
      SUM(num_comments) AS num_comments,
      SUM(num_predictions) AS num_predictions,
      user_id
    FROM post_view GROUP BY user_id),
  pred_likes AS (
    SELECT
      SUM(num_likes) AS num_likes,
      SUM(num_dislikes) AS num_dislikes,
      SUM(num_comments) AS num_comments,
      user_id
    FROM prediction_view group by user_id),
  comm_likes AS (
    SELECT
      SUM(num_likes) AS num_likes,
      SUM(num_dislikes) AS num_dislikes,
      user_id
    FROM comment_view group by user_id)
SELECT
  u.id, u.updated_at, u.username, u.avatar_url, u.website, u.created_at, u.bio, u.verified, expo_push_token IS NOT NULL AS push_token_set,
  COALESCE(po.num_likes, 0) AS num_post_likes, COALESCE(po.num_dislikes, 0) AS num_post_dislikes, COALESCE(po.num_comments, 0) AS num_post_comments, COALESCE(po.num_predictions, 0) AS num_post_predictions,
  COALESCE(pr.num_likes, 0) AS num_pred_likes, COALESCE(pr.num_dislikes, 0) AS num_pred_dislikes, COALESCE(pr.num_comments, 0) AS num_pred_comments,
  COALESCE(co.num_likes, 0) AS num_comm_likes, COALESCE(co.num_dislikes, 0) AS num_comm_dislikes
FROM profile u
LEFT JOIN post_likes po ON u.id = po.user_id
LEFT JOIN pred_likes pr ON u.id = pr.user_id
LEFT JOIN comm_likes co ON u.id = co.user_id;

-- Function Return Type Views

create view posts_function_return as SELECT *, null::timestamp with time zone AS followed_at, null::text AS like_status from post_view WHERE false;
create view comments_function_return as SELECT *, null::text AS like_status from comment_view WHERE false;
create view pred_function_return as SELECT *, null::text AS like_status from prediction_view WHERE false;

-- SELECT Functions

create function get_posts(
  feed_type text,
  page_offset integer,
  page_size integer,
  search_term text default null,
  search_tag text default null,
  profile_id text default null) 
returns setof posts_function_return
language plpgsql
as $$
declare
  sql text;
  where_filter text;
  order_by text;
begin

  if auth.uid() is null then 
    sql = 'SELECT p.*,
      NULL::timestamp with time zone AS followed_at,
      NULL::text AS like_status
      FROM post_view p ';
  else
    sql = 'SELECT p.*,
      f.created_at as followed_at,
      (case when l.created_at IS NULL THEN ''none'' WHEN l.is_up THEN ''liked'' ELSE ''disliked'' END)::text AS like_status
      FROM post_view p
      LEFT JOIN post_like l ON p.id = l.post_id AND l.user_id = auth.uid()
      LEFT JOIN post_follow f ON p.id = f.post_id AND f.user_id = auth.uid() ';
  end if;

  if feed_type = 'trending' then 
      where_filter = 'p.is_public';
      order_by = 'p.trend_score DESC, p.created_at';
  elseif feed_type = 'following' then
      where_filter = 'f.created_at IS NOT NULL AND p.check_date > current_date';
      order_by = 'f.created_at DESC';
  elseif feed_type = 'notified' then 
      where_filter = 'f.created_at IS NOT NULL AND p.check_date < current_date';
      order_by = 'p.check_date DESC, p.created_at';
  elseif feed_type = 'newest' then
      where_filter = 'p.is_public';
      order_by = 'p.created_at DESC';
  elseif feed_type = 'personal' then
      where_filter = 'NOT p.is_public AND p.user_id = auth.uid()';
      order_by = 'p.created_at DESC';
  end if;

  if profile_id is not null then
    where_filter = where_filter || format(' AND p.user_id = %L ', profile_id);
  end if;

  if search_term is not null then
    where_filter = where_filter || format(' AND subject ~* %L', search_term);
  end if;

  if search_tag is not null then 
    where_filter = where_filter || format(' AND %L = any (tags) ', search_tag);
  end if;

  sql = sql 
          || ' WHERE ' || where_filter 
          || ' ORDER BY ' || order_by
          || format(' LIMIT %L OFFSET %L', page_size, page_size * page_offset);

  RETURN QUERY EXECUTE sql;
end
$$;

create function get_comments(page_offset integer, page_size integer, parent_id bigint, parent_type text) 
returns setof comments_function_return
language plpgsql
as $$
declare
  sql text;
  parent_col text;
begin
  parent_col = 'parent_' || parent_type;

  if auth.uid() = null then
    sql = 'SELECT c.*,
      (case when l.created_at IS NULL THEN ''none'' WHEN l.is_up THEN ''liked'' ELSE ''disliked'' END)::text AS like_status
      FROM comment_view c
      LEFT JOIN comment_like l ON c.id = l.comment_id AND l.user_id = auth.uid()
      WHERE %I = $1
      ORDER BY c.trend_score DESC, c.created_at
      LIMIT $2 OFFSET $3';
  else
    sql = 'SELECT c.*,
      ''none'' AS like_status
      FROM comment_view c
      WHERE %I = $1
      ORDER BY c.trend_score DESC, c.created_at
      LIMIT $2 OFFSET $3';
  end if;

  RETURN QUERY EXECUTE format(sql, parent_col) using parent_id, page_size, page_size * page_offset;
end
$$;

create or replace function get_predictions(_post_id bigint, page_offset integer, page_size integer) 
returns setof pred_function_return
language plpgsql
as $$
declare 
  sql text;
  like_status_col text;
  join_col text = '';
begin

  if auth.uid() is null then
    like_status_col = '''none'' AS like_status';
  else
    like_status_col = '(case when l.created_at IS NULL THEN ''none'' WHEN l.is_up THEN ''liked'' ELSE ''disliked'' END)::text AS like_status';
    join_col = 'LEFT JOIN prediction_like l ON p.id = l.prediction_id AND l.user_id = auth.uid()';
  end if;

  sql = 'SELECT p.*, ' || like_status_col || 
        ' FROM prediction_view p
        ' || join_col || '
         WHERE p.post_id = $1
         ORDER BY p.trend_score DESC, p.created_at
         LIMIT $2 OFFSET $3';

  return QUERY EXECUTE sql using _post_id, page_size, page_size * page_offset;
end
$$;


-- UPSERTING Functions
CREATE OR REPLACE FUNCTION toggle_like(parent_type text, id bigint, status text)
 RETURNS void
 LANGUAGE plpgsql
AS $$
declare
  is_up_var boolean;
  del_sql text = 'DELETE FROM %I WHERE %I = $1 AND user_id = auth.uid()';
  ins_sql text = 'INSERT INTO %I (%I, user_id, is_up)
    VALUES ($1, auth.uid(), $2)
    ON CONFLICT ON CONSTRAINT %I
    DO UPDATE SET is_up = $2';
  table_name text;
  id_col_name text;
  constraint_name text;
begin

  is_up_var = status = 'liked';
  table_name = parent_type || '_like';
  id_col_name = parent_type || '_id';
  constraint_name = parent_type || '_like_pkey';

  if status = 'none' then
    EXECUTE format(del_sql, table_name, id_col_name) USING id;
  else
    EXECUTE format(ins_sql, table_name, id_col_name, constraint_name) USING id, is_up_var;
  end if;
end
$$;

-- Notifications

CREATE FUNCTION send_notifications_to_expo(post_id bigint, post_subject text, is_public boolean, push_tokens text[])
  returns void
  language plpgsql
AS $$
declare 
  filtered_tokens text[] = array[]::text[];
  push_token text;
  body_obj jsonb;
  post_obj jsonb;
  data_obj jsonb;
begin

  foreach push_token in array push_tokens
  loop 
    if LENGTH(push_token) > 0 then
      filtered_tokens = ARRAY_APPEND(filtered_tokens, push_token);
    end if;
  end loop;

  post_obj = json_build_object('id', post_id, 'is_public', is_public);
  data_obj = jsonb_build_object('post', post_obj);
  body_obj = jsonb_build_object(
    'to', filtered_tokens, 
    'title', post_subject, 
    'body', 'Time to check in on a prediction!', 
    'data', data_obj);

  PERFORM net.http_post(
      url:='https://exp.host/--/api/v2/push/send',
      body:=body_obj::jsonb
  );
end
$$;


CREATE FUNCTION partition_rows(_arr text[], _size integer)
  returns text[][]
  LANGUAGE plpgsql
AS $$
declare
  partitioned text[][] = Array[array[]::text[]]::text[][];
  tmp_row text[] = '{}'::text[];
  element text;
  counter integer;
  num_remaining integer;
begin
  FOREACH element IN ARRAY _arr
  LOOP
    if ARRAY_LENGTH(tmp_row, 1) = _size then
      partitioned = partitioned || ARRAY[tmp_row];
      tmp_row = '{}'::text[];
    end if;
    raise notice '% - % ', tmp_row, element;
    tmp_row = ARRAY_APPEND(tmp_row, element);
  END LOOP;

  num_remaining = _size - array_length(tmp_row, 1);

  for counter in 1..num_remaining
  loop
    tmp_row = array_append(tmp_row, '');
  end loop;

  partitioned = partitioned || array[tmp_row];

  return partitioned;
end
$$;


CREATE FUNCTION handle_post(_post_id bigint, post_subject text, is_public boolean)
  RETURNS void
  LANGUAGE plpgsql
AS $$
declare
  tokens text[];
  token text;
  request text;
  partitioned_tokens text[][];
  partitioned_row text[];
  num_tokens int8;
begin
  tokens = '{}'::text[];

  FOR token IN 
    SELECT expo_push_token FROM profile p
    RIGHT JOIN post_follow f ON f.user_id = p.id
    WHERE f.post_id = _post_id
  LOOP
    tokens = ARRAY_APPEND(tokens, token);
  END LOOP;

  num_tokens = cardinality(tokens)::int8;
  if num_tokens > 0 then
    partitioned_tokens = partition_rows(tokens, 1);

    foreach partitioned_row slice 1 in array partitioned_tokens
    loop 
      perform send_notifications_to_expo(_post_id, post_subject, is_public, partitioned_row);
    end loop;
  end if;

  UPDATE post SET notifications_sent = num_tokens WHERE id = _post_id;
end
$$;


CREATE OR REPLACE FUNCTION process_notifications()
 RETURNS void
 LANGUAGE plpgsql
AS $$
declare
  time_interval_min integer = 5;
  post_row record;
begin
  FOR post_row IN 
     SELECT * FROM post 
    WHERE check_date <= now() + interval '20 minutes' AND check_date > now() AND notifications_sent < 0
  LOOP 
    perform handle_post(post_row.id, post_row.subject, post_row.is_public);
  END LOOP;
end
$$;

-- TRIGGERS
CREATE OR REPLACE FUNCTION handle_manual_closed_post() RETURNS TRIGGER AS $$
   BEGIN
      if new.check_date != old.check_date OR (new.check_date is not null and old.check_date is null) then
        perform handle_post(new.id, new.subject, new.is_public);
      end if;
      RETURN NEW;
   END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manual_closed_post_trigger
  AFTER UPDATE
  ON post
  FOR EACH ROW
  EXECUTE PROCEDURE handle_manual_closed_post();

-- SELECT cron.schedule('*/5 * * * *', $CRON$ SELECT process_notifications(); $CRON$);