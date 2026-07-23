begin;

delete from public.court_reports
where id in (
  '3d741220-3e8a-4e92-ac44-4c1ff81b6ea1',
  '3f6321ae-763b-40b0-a3d2-83b43a79db93',
  'ff248796-b47a-4070-abb1-1e1ad0e618c1',
  'c9011923-1ff5-4753-b6c6-0a0fa65b3120',
  '89861d37-418a-4292-8a04-06f4a272c2b2',
  '2cc1106a-ab41-4041-95eb-dc05367c018a',
  '05e47861-1cd3-4a88-8743-6fc6a35d5dfc',
  '9602da4c-bec0-4593-8817-e6b87c73cbad',
  '5c16335b-ac2c-41ef-a07d-7b6ccb2d26ad',
  '74b6b9d7-f880-4942-9dd0-edbc28d987ba',
  '55588ed7-f07d-464f-932f-77486a49ac2a',
  'a4a6eba3-0226-424d-96db-b8ec00bb2e1b',
  '9b2ef507-e519-4289-b936-f11bc25df0eb'
);

alter table public.court_reports
drop constraint if exists court_reports_queue_consistency_check;

alter table public.court_reports
add constraint court_reports_queue_consistency_check check (
  (open_courts > 0 and waiting_parties = 0)
  or (open_courts = 0 and waiting_parties >= 1)
);

commit;
