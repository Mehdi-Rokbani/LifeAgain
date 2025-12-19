export const getAvatarUrl = (user) => {
    if (!user?.profilePicture) return null;
    if (user.profilePicture.includes("default-avatar.png")) return null;

    return user.profilePicture.startsWith("http")
        ? user.profilePicture
        : `http://localhost:5000${user.profilePicture}`;
};
