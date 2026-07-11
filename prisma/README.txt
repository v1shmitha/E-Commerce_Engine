-- AFTER RESETTING THE db

npx prisma migrate deploy
npx prisma generate
pnpm seed

-- After That — Re-apply RLS Policies