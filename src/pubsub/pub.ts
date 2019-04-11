import * as mongoose from 'mongoose'
import {Schema} from 'mongoose'

const connection = mongoose.createConnection('mongodb://localhost:27017,localhost:27018,localhost:27019/temp?replicaSet=rs')

const model = connection.model('pubTest', new Schema({}, {strict: false}), 'pubTest')

model.watch({fullDocument: 'updateLookup'}).on('change', data => console.log(data))
