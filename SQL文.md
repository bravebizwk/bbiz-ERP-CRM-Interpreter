INSERT INTO sidebar_menu (
    id,
    label,
    path,
    icon
)
VALUES (
    80,
    'Routine',
    '/5',
    'routine'
);


DELETE FROM users
WHERE id BETWEEN 2 AND 14;

INSERT INTO users (
    id,
    name,
    email,
    role,
    status,
    joined_date
)
VALUES (
    '長谷川千恵子',
    'hasegawa@bravebizwk.com',
    'staff',
    'active',
    '2026-01-01'
);
