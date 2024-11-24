const convertToDateTime = (unixTimestamp) => {
  const date = new Date(unixTimestamp).toLocaleString();
  return date
};

export default convertToDateTime;
