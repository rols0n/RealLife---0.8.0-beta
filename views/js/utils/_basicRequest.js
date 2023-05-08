export async function basicRequest(
  raw,
  LINK,
  requestOptions,
  msg,
  errorHandling,
  returnObj
) {
  if (raw) requestOptions.body = raw;

  const response = await fetch(LINK, requestOptions);
  const result = await response.json();
  if (msg && errorHandling) {
    if (result.status !== "success")
      window.alert(`Something went wrong with ${msg}. Try again later`);
    if (returnObj) return result;
    else return;
  } else return result;
}
