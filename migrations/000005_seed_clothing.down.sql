BEGIN;

-- Delete seeded clothing items
DELETE FROM clothing_items
WHERE id IN (
    'd13eb564-9b74-469e-8e4a-b321d36cef6f',
    '2aa819d8-98ac-45e9-b195-d6fc65cca429',
    '48ad6ece-cb44-4ea9-96e5-c669be4099da',
    'f206732f-033d-49ab-af4a-19295ed0267b',
    '1c1558ce-46a5-4811-8c15-fe8e317a60cc',
    '05b8fa7a-e105-4ce4-9b9e-734a2395271b',
    'ac954faf-724e-4c68-b8a2-8914e2664e5a',
    'a8c56096-67a0-4c77-938b-2e903da64ad4',
    '5db78abb-4dec-4056-bed1-e3a6a15f0030',
    '101b7b0b-9b80-4e97-b655-29cdd5bffc3b',
    'cf20e213-a25b-40e4-951a-ddd60090da39',
    'ef0767d9-bf6f-42a7-b2ff-9785a1699ab4',
    '044a189f-2016-4319-a05b-919a90228014',
    '8ca2bf43-01b8-4916-bbb7-84c2b367fdaf',
    '97f74c3b-448f-4c84-8771-00eb56f53933',
    'dda6169a-c012-490d-bfc2-c42d8b3f1470',
    '72fe7c02-7e1d-4763-b399-d5df42b6f4a3',
    '5b2206a0-fcc9-4558-b5a4-975790a745ee',
    'b81fe3ec-43e6-48bc-840c-f8f5e235a4bb',
    'bb7a0e61-3954-4885-bf8b-3ae103272823',
    '68ec710a-00d2-46df-8941-6adbbd8f7c80',
    '100774db-4de0-4ba9-b399-3b9be94015fc',
    '91b15a50-f291-4a13-8946-7fb3587c1326',
    '7da03cee-4b75-489e-8b86-282f294f52b9',
    'c2972c1c-d102-4450-bf3e-6d6c2b58eab2',
    '1019a8f4-5d51-48c1-b0a3-4dcceea4dd37',
    'e6009d01-fbd9-47c0-950b-471cca41277b',
    '21c852cd-d2f1-48de-841f-dfa5bd505fbf',
    'f573c59c-1de8-4b43-98c7-8381bebbf269',
    '96ee7ed0-53d4-4e9e-a1a5-d859eb93c3ce',
    'ff8872ea-7830-4739-9118-b63232b64858',
    '480f2a82-ae34-4d8b-82c1-5c86152f6ace',
    '18f2d912-89c2-4645-8435-b5392b0cf4c2',
    '928d2fde-7c72-4483-9163-f4944a264ea8',
    '87e42b6d-3d20-4b89-a30e-cabb92a62ac7',
    '29db3807-902e-4150-b63f-1f85c3853705',
    '6be35639-e021-44e5-98fe-db286c121eff',
    'f00e258d-fc64-441d-aa82-f9fb9d268f1c',
    '22cc8027-4027-4550-bef7-494d2a1faad7',
    'b603ab93-d961-4296-9ac9-3bf451d46642',
    '8b2dfaa4-913c-4b86-8040-bb1601566858',
    'b6b4e2c0-1609-4302-8648-f8f8335e3d62',
    '2744d0c3-91d6-410f-bedb-11d303168871',
    'e0c720d8-4dbc-43c8-85a4-2d723c21531b',
    '74de5135-cd54-4991-96e8-907e070c10e0',
    '10ba4109-db9c-4568-a5db-a45975e7a187',
    'e1fee041-cc57-4f8e-b29c-ae7e6f808d9f',
    '30d101b6-19e4-4a51-89b2-fff64d2ddf16',
    'a7bb92b3-dfd1-431d-b2af-21ee700328d8',
    'a7fe5c84-01b5-474c-89f6-56dddf2de8f8',
    'cf3110ff-0ca4-4467-b26a-67b81ad6177c',
    '715d0ecc-d798-4480-b71c-01d589be7958',
    'f580daf7-5dea-404b-b8f9-cf8797a18ab0',
    '629a6b90-d7af-48af-a890-3e3fdf8bc83b'
);

-- Delete seeded child categories
DELETE FROM categories
WHERE id IN (
    'c6449630-6b37-402a-99f2-f538e5a97e8b', -- T-paidat
    'e343d949-541a-4fa2-a3c0-a34c4fa6fb6c', -- Pujotettavat bodyt
    'a9123482-25a7-4705-881e-6345de5c3428', -- Kietaisubodyt
    'a55b5816-14de-4233-ad44-bb0323fd3e40', -- Vetoketjulliset
    '84e6c3ed-3807-4a3f-a9c0-5f948bf2c8cc'  -- Muut (Yökkärit)
);

-- Delete seeded root categories
DELETE FROM categories
WHERE id IN (
    '9c7493a4-2e78-42d0-a7b5-83b10921759a', -- Bodyt
    '9dbf7bf6-b9d5-4d7a-be05-766777908341', -- Housut
    'ec4b121e-8443-4166-9850-f8b3d4bf0c5a', -- Yökkärit
    '0b7eeee7-5729-46d5-a2c3-e071bee908f2', -- Haalarit
    '6c428cdc-7264-43a6-a993-5481e21f3adb', -- Unipussit
    '0a30de2c-3f88-4c83-8955-84196e64b6bf', -- Paidat
    '5ee0991f-437e-4b0e-9173-6c22943e7d80'  -- Muut
);

-- Delete seeded sizes
DELETE FROM sizes
WHERE id IN (
    '18113c4a-9f8c-4161-875f-091a1cdec291',
    '85bccb89-fbf7-45ed-ae6e-ffe75ce2da33',
    '30657a6d-0ab0-4c39-bb53-7af0daefb81e',
    'c9654bbc-1fcd-40c2-bc93-171c14b81e0e',
    '4c12aa2f-c879-476c-b89a-30b2580e6eaa',
    '526f284c-84b2-4811-9eb2-324054e5d65b',
    '7564a54c-2100-4931-b2fb-bce9a6af2dcd',
    'a679d021-2e52-4218-9daa-52192c048ec2',
    'fb3f8a36-d49f-43b0-9e67-eed603214aa4',
    'd5298caf-9bb9-49df-8cc3-e769c03475aa',
    '667bfff0-5660-4a22-9828-34e02fa7efe4',
    '4a23990a-e5a6-4f75-ac0d-49c31e4531af',
    'e6185809-12f6-49c0-8a2b-749ff63ed0a8',
    '1c07f5c3-e945-4f83-9033-99148bfbb3e6',
    'c2fd1eb0-a08c-4391-b872-5e3985bf23d1',
    '2c5a9f70-78b6-4020-b2f0-febb4aa8bcdd'
);

COMMIT;