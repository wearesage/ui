import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const PACKAGE_NAME = `@s3`;
const yapEnv = envar => console.warn(`${PACKAGE_NAME}: environment variable "${envar}" is undefined.`);
const yapConfig = configvar => console.warn(`${PACKAGE_NAME}: "${configvar}" is a required configuration parameter.`);

async function uploadImage({ accessKeyId, secretAccessKey, bucket, folder, image, id, region }) {
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const binaryData = Buffer.from(base64Data, 'base64');

  const params = {
    Bucket: bucket,
    Key: `${folder}/${id}.jpg`,
    Body: binaryData,
    ContentEncoding: 'base64',
    ContentType: `image/jpeg`,
    ACL: 'public-read',
  };

  try {
    const result = await s3Client.send(new PutObjectCommand(params));
    console.log(`Successfully uploaded ${id}.jpg to S3`, result);
    return result;
  } catch (error) {
    console.error('Error uploading image to S3:', error);
  }
}

export default (app, config = {}) => {
  const {
    baseUrl,
    region,
    bucket,
    folders,
    env: { EXPRESS_S3_ACCESS_KEY, EXPRESS_S3_SECRET_KEY },
  } = {
    region: 'us-west-1',
    baseUrl: '/api/s3',
    folders: [],
    ...config,
  };

  if (!EXPRESS_S3_ACCESS_KEY) yapEnv('EXPRESS_S3_ACCESS_KEY');
  if (!EXPRESS_S3_SECRET_KEY) yapEnv('EXPRESS_S3_SECRET_KEY');
  if (!bucket) yapConfig('bucket')

  const accessKeyId = EXPRESS_S3_ACCESS_KEY;
  const secretAccessKey = EXPRESS_S3_SECRET_KEY;

  folders.forEach(folder => {
    app.post(`${baseUrl}/${folder}`, async (req, res) => {
      try {
        const {
          body: { image, id },
        } = req;
  
        await uploadImage({ accessKeyId, secretAccessKey, region, folder, bucket, image, id });
        res.send({ success: true });
      } catch (e) {
        console.log(e);
        res.status(500);
        res.send({ success: false, data: e });
      }
    });
  })
};
