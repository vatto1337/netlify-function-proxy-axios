
const axios = require("axios");

const matchFileURL = async (url) => {
  const regex = new RegExp(`(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)`);
  const matchFileType = regex.test(url);
  const domains = ["/assets/"]
  let matchesDomain = false;
  domains.forEach((dom) => {
    if(url.includes(dom)) {
      matchesDomain = true;
    }
  })
  return (matchesDomain === true || matchFileType === true) ? true : false;
}

exports.handler = async (event) => {
  const urlPath = event.path.replace(`/.netlify/functions/proxy/`, '');
  const urlFormatted = `${process.env.REACT_APP_CONTENT_URL}/${urlPath}`;
  const isFileRequested = await matchFileURL(urlFormatted);
  const method = event.httpMethod.toString().toUpperCase();

  const bodyRequest = {
    method,
    headers: {
      "Authorization": `Bearer ${process.env.REACT_APP_CONTENT_API_KEY}`
    },
    data: method === "POST" ? (event.body.length > 0 ? JSON.parse(event.body) : {}) : undefined,
    responseType: isFileRequested ? `arraybuffer` : `json`
  }

  const response = await axios(urlFormatted, bodyRequest);

  const serverResponse = {
    statusCode: response.status,
    headers: {
      "content-type": response.headers["content-type"]
    },
    body: isFileRequested ? response.data.toString('base64') : JSON.stringify(response.data),
    isBase64Encoded: isFileRequested
  }  
  return serverResponse;
}