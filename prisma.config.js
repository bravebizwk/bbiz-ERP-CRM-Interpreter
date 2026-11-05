export default {
    orm: {
        adapter: {
            provider: "postgresql",
            url: process.env.DATABASE_URL,
        },
        family: {
            name: "postgresql",
        },
        target: {
            provider: "postgresql",
        },
    },
};