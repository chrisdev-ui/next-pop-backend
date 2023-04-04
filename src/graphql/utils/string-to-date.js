const stringToDate = (date) => {
  const parsedDate = new Date(date)
  if (!isNaN(parsedDate.getTime())) return parsedDate
}

export default stringToDate
