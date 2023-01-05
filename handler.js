"use strict";
const DynamoDb = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDb.DocumentClient({
  region: "us-east-1",
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};

module.exports.createNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // console.log(event);
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        description: data.description,
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    };

    await documentClient.put(params).promise();
    callback(null, {
      statusCode: 201,
      body: JSON.stringify(data),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }
};

module.exports.updateNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters.id;
  let data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: "set #title = :title, #description = :description",
      ExpressionAttributeNames: {
        "#title": "title",
        "#description": "description",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":description": data.description,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };

    await documentClient.update(params).promise();
    callback(null, send(200, data));
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(`The note ${notesId} has been updated succesfull!`),
  };
};

module.exports.deleteNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters.id;

  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)",
    };

    let response = await documentClient.delete(params).promise();
    callback(null, send(200, response));
  } catch (error) {
    callback(null, send(500, error.message));
  }
};

module.exports.getNotes = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
    };

    let response = await documentClient.scan(params).promise();
    callback(null, send(200, response));
  } catch (error) {
    callback(null, send(500, error.message));
  }
};
