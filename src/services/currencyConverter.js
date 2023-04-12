import axios from 'axios'

const { FIXER_API_KEY } = process.env

async function currencyConverter({ amount, fromCurrency, toCurrency }) {
  const url = `https://api.apilayer.com/fixer/convert?to=${toCurrency}&from=${fromCurrency}&amount=${amount}`
  const url2 = `https://api.apilayer.com/currency_data/convert?to=${toCurrency}&from=${fromCurrency}&amount=${amount}`
  const headers = {
    apikey: FIXER_API_KEY
  }
  try {
    const response = await axios.get(url, { headers })
    return response.data.result
  } catch (error) {
    try {
      const response = await axios.get(url2, { headers })
      return response.data.result
    } catch (error) {
      console.error(error)
      throw new Error(error.message)
    }
  }
}

export default currencyConverter
