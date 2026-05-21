#!/bin/sh

# ዴታቤዙ ሙሉ በሙሉ እስኪነሳ 5 ሰከንድ መታገስ
echo "Waiting for database to be ready..."
sleep 5

# የፕሪዝማ ማይግሬሽን አውቶማቲክ በሆነ መንገድ በዴታቤዙ ላይ መጫን
echo "Running database migrations..."
npx prisma db push --accept-data-loss

# አፑን በ Production ሞድ ማስጀመር (በ server.js በኩል)
echo "Starting Next.js application..."
node server.js