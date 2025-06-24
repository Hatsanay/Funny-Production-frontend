import axios from 'axios';
export const decodeJWTTH = (token) => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new Error('Invalid token format');
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(payload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };
  
  export const getPermissions = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedPayload = decodeJWTTH(token);
      return decodedPayload?.permissions || '';
    }
    console.log('Token not found');
    return '';
  };
  
  export const getUserID = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedPayload = decodeJWTTH(token);
      return decodedPayload?.id || '';
    }
    console.log('Token not found');
    return '';
  };
  
  export const hasPermission = (permission) => {
    const permissionsMap = [
      'logout',                   //0
      'home',                     //1
      'dashboard1',               //2

      'queueView',                //3
      'CreateQueueGraphic',       //4
      'EditQueueGraphic',         //5
      'DeleteQueueGraphic',       //6
      'HistoryQueueGraphic',      //7

      'CreateQueueUi',            
      'EditQueueUi',              
      'DeleteQueueUi',            
      'HistoryQueueUi',      

      'CreateQueueAnimation',     
      'EditQueueAnimation',       
      'DeleteQueueAnimation',     
      'HistoryQueueAnimation',      

      
    ];
    
    const permissionsToken = getPermissions();
    localStorage.setItem("permissions", permissionsToken);
    const UserID = getUserID();
    localStorage.setItem("userID", UserID);
    let lUserId = localStorage.getItem('userID');
    console.log("userID "+lUserId)
  
    if (!permissionsToken) {
      console.error('Permissions token not found');
      return false;
    }
  
    const permissions = permissionsToken.split('').map((bit) => bit === '1');
    const index = permissionsMap.indexOf(permission);
    if (index === -1) {
      console.error('Permission not found:', permission);
      return false;
    }
    return permissions[index] === true;
  };
  
  export const isAuthenticated = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
    // return !!localStorage.getItem('token') || !!sessionStorage.getItem('token');
  };

  export const logoutLog = async () => {
    try {
        const logID = localStorage.getItem('LogID');
        if (logID) {
            await axios.post('/api/auth/logLogOut', { LogID: logID });
            localStorage.removeItem('LogID');
            console.log("Logout")
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
};

  
  export const clearToken = async () => {
    await logoutLog();
    
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userID');
    sessionStorage.removeItem('userID');
    // localStorage.removeItem('localUserid');
    // sessionStorage.removeItem('localUserid');
  };
  
  