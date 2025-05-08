import { getCurrentUser, setCurrentUser } from './global';

export const fetchWishlist = async () => {
  const rawUser = getCurrentUser();
  if (!rawUser) {
    console.error('No user found');
    return null;
  }

  const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
  if (!user.account_id) {
    console.error('No account_id found in user data');
    return null;
  }

  try {
    console.log('Fetching wishlist for user:', user.account_id);
    const response = await fetch(`http://localhost:8080/customers/get-wishlist?customerID=${user.account_id}`);
    
    if (!response.ok) {
      console.error('Failed to fetch wishlist:', response.status);
      throw new Error('Failed to fetch wishlist');
    }
    
    const wishlist = await response.json();
    console.log('Received wishlist from backend:', wishlist);
    
    // Update user object with new wishlist
    const updatedUser = {
      ...user,
      wishlist: wishlist
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return wishlist;
  } catch (error) {
    console.error('Error in fetchWishlist:', error);
    return null;
  }
};

export const removeFromWishlist = async (product) => {
  const rawUser = getCurrentUser();
  if (!rawUser) {
    console.error('No user found');
    return false;
  }

  const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
  if (!user.account_id) {
    console.error('No account_id found in user data');
    return false;
  }

  try {
    console.log('Removing product from wishlist:', product);
    const response = await fetch(`http://localhost:8080/customers/drop-wishlist?customerID=${user.account_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) {
      console.error('Failed to remove from wishlist:', response.status);
      throw new Error('Failed to remove from wishlist');
    }

    // After successful removal, fetch the updated wishlist
    const updatedWishlist = await fetchWishlist();
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

export const markWishlistForUpdate = () => {
  const user = getCurrentUser();
  if (!user) return;

  const updatedUser = {
    ...user,
    wishlistNeedsUpdate: true
  };
  
  setCurrentUser(updatedUser);
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
};

export const checkAndUpdateWishlist = async () => {
  const user = getCurrentUser();
  if (!user || !user.wishlistNeedsUpdate) return;

  return await fetchWishlist();
}; 