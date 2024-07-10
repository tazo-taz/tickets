const axios = require("axios")
const cookie = 'session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalkyT0RrMFpHRTVOMkl4WkRoa01qVTNNRFJpTVdZME1pSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCbmJXRnBiQzVqYjIwaUxDSnBZWFFpT2pFM01qQXlOelF6TkRWOS41T2xYSXd0TzZTc0NqcnlCN0NSU3R0ZG9lV2x5QnJBOVRVeU9RZlRXc1hrIn0='

const doRequest = async () => {
  const { data } = await axios.post('https://ticketing.dev/api/tickets',
    {
      title: 'Concert',
      price: 20
    },
    {
      headers: {
        Cookie: cookie
      }
    })

  await axios.put(`https://ticketing.dev/api/ticket/${data.id}`, {
    title: 'Concert1',
    price: 30
  }, {
    headers: {
      Cookie: cookie
    }
  })

  axios.put(`https://ticketing.dev/api/ticket/${data.id}`, {
    title: 'Concert1',
    price: 30
  }, {
    headers: {
      Cookie: cookie
    }
  })
}


for (let i = 0; i < 400; i++) {
  doRequest()
}