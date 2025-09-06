module.exports = {
  formatDate: (date) => {
    return new Date(date).toLocaleString();
  },
  
  truncateText: (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  },
  
  calculateResponseTime: (createdAt, respondedAt) => {
    const diff = new Date(respondedAt) - new Date(createdAt);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
};