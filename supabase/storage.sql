-- =====================================================================
-- revo fit — Storage バケット作成（avatars / posts）＋アクセスポリシー
-- SQL Editor で全文実行。何度実行しても安全。
-- =====================================================================

-- バケット（Public＝公開URLで読める。書き込みは下のポリシーで本人のみに制限）
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('posts','posts', true)
  on conflict (id) do nothing;

-- 読み取り（公開バケットだがAPI経由の一覧取得等のためにselectも許可）
drop policy if exists "revo_storage_read" on storage.objects;
create policy "revo_storage_read" on storage.objects
  for select using (bucket_id in ('avatars','posts'));

-- avatars：本人のファイル（<uid>.jpg）のみアップロード・更新可
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and name = auth.uid()::text || '.jpg');
drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '.jpg');

-- posts：本人フォルダ（<uid>/…）のみアップロード・更新可
drop policy if exists "posts_insert_own" on storage.objects;
create policy "posts_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "posts_update_own" on storage.objects;
create policy "posts_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);
