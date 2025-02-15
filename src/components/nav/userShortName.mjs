const userShortName = (name) => {
    // Remove spaces and check the length of the name
    const trimmedName = name.replace(/\s+/g, '');
    
    // If the name is longer than 10 characters, return the shorter part
    if (trimmedName.length > 10) {
      // Split name into first and last part
      const nameParts = trimmedName.split(/(?=[A-Z])/); // Split based on capital letters
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts[1] : '';
  
      // Return the shorter part of the name
      return firstName.length <= lastName.length ? firstName : lastName;
    }
  
    return trimmedName; // Return the whole name if it's within the 10 character limit
  };
  
  export default userShortName;
  