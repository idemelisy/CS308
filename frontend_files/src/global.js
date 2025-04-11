let CURRENT_USER = null;

export const getCurrentUser = () => CURRENT_USER;

export const setCurrentUser = (user) => {
    CURRENT_USER = user;
};