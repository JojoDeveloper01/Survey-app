import express from 'express'

const app = express()
const port = 3000

app.post('/api/submit', (req, res) => {

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
