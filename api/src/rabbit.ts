import amqp from "amqplib";

export const createChannel = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URI);

  const channel = await connection.createChannel();

  channel.assertQueue("medias", { durable: true });

  return { connection, channel };
};
