import * as mongoose from 'mongoose'
import {Schema} from 'mongoose'
import * as bluebird from 'bluebird'

// 多个事务演示 事务冲突
async function run () {
  const connection = await mongoose.createConnection('mongodb://localhost:27017,localhost:27018,localhost:27019/temp?replicaSet=rs',  { useNewUrlParser: true })
  const model = connection.model('transactionTest', new Schema({}, {strict: false}), 'transactionTest')
  await model.deleteMany({})
  const [record] = await model.create([{version: 1}])

  const sessionA = await connection.startSession()
  const sessionB = await connection.startSession()

  await sessionA.startTransaction()
  await sessionB.startTransaction()
  const be = await model.findById(record.id).lean()
  console.log(`before: re: ${JSON.stringify(be)}`)

  try {
    await model.findByIdAndUpdate(record.id, {$set: {version: 2}}).session(sessionA).lean()
  } catch (e) {
    console.log('提交之前的A error', e)
  }

  try {
    await model.findByIdAndUpdate(record.id, {$set: {version: 3}}).session(sessionB).lean()
  } catch (e) {
    console.log('提交之前的B error', e)
  }


  try {
    await sessionB.commitTransaction()
  } catch (e) {
    console.log('提交之后的B error', e)
  }

  try {
    await sessionA.commitTransaction()
  } catch (e) {
    console.log('提交之后的A error', e)
  }

  const af = await model.findById(record.id).lean()
  console.log(`after: re: ${JSON.stringify(af)}`)

}

run()
