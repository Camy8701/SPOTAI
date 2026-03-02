

# Assign Admin Role to LYNCK Studio

## What will be done
Insert a new row into the `user_roles` table to grant the `admin` role to the second user (LYNCK Studio).

## Technical Details
- **User**: LYNCK Studio (user_id: `b40ab73b-0f2c-47fb-b08a-4bd84d1dfeb9`)
- **Action**: Insert a new `user_roles` row with role = `admin`
- **SQL**: `INSERT INTO user_roles (user_id, role) VALUES ('b40ab73b-0f2c-47fb-b08a-4bd84d1dfeb9', 'admin')`

After this, LYNCK Studio will see the shield icon in the header and have full access to the Admin Dashboard at `/admin`.

