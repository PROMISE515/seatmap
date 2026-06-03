-- Previous name_en values may have been produced by an older translation
-- strategy. Clear them once so the app can repopulate with the current
-- Youdao-backed translator on the next search/detail load.
UPDATE public.toilets
SET name_en = NULL
WHERE name_en IS NOT NULL;
