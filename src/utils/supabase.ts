import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { MyConstants } from './constants';

export const supabase = createClient(
  MyConstants.supabaseUrl,
  MyConstants.supabaseAnonKey,
  { localStorage: AsyncStorage }
);

export const toSqlString = (date: Date) =>
  date.toISOString().slice(0, 19).replace('T', ' ');

export const parseSqlDateString = (dateString: string) =>
  new Date(dateString.replace(' ', 'T') + 'Z');

export const dateToDisplay = (dateString?: string) =>
  dateString
    ? parseSqlDateString(dateString).toLocaleDateString()
    : '' + dateString;
