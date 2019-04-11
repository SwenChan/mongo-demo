import * as mongoose from 'mongoose'
import {Schema} from 'mongoose'
import * as bluebird from 'bluebird'

// 单个事务演示
async function run () {
  const connection = await mongoose.createConnection('mongodb://localhost:27017,localhost:27018,localhost:27019/temp?replicaSet=rs',  { useNewUrlParser: true })
  const model = connection.model('transactionTest2', new Schema({}, {strict: false}), 'transactionTest2')

  const session = await connection.startSession() // 分配一个session
  session.startTransaction()
  await model.create([{transaction: 1}], {session: session})
  const beforeCommit = await model.find({transaction: 1}).lean()
  const beforeCommitCountAll = await model.count({}) // 坑1 可以count全部可以出来
  const beforeCommitCount = await model.count({transaction: 1}) // 坑1 可以count加上条件就找不出来
  console.log(`allNum: ${beforeCommitCountAll}, countNum: ${beforeCommitCount}, ${JSON.stringify(beforeCommit)}`)
  // await bluebird.delay(10000)
  await session.commitTransaction()
  const afterCommit = await model.find({}).lean()
  const afterCommitCountAll = await model.count({})
  const afterCommitCount = await model.count({transaction: 1})

  console.log(`allNum: ${afterCommitCountAll}, countNum: ${afterCommitCount}, ${JSON.stringify(afterCommit)}`)
}

run()
