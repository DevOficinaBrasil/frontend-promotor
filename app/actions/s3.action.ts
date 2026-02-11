"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function uploadImageToS3(formData: FormData) {
  const file = formData.get("file") as File;
  const campanhaName = formData.get("campanhaName") as string || "geral";

  if (!file) {
    throw new Error("Nenhum arquivo enviado");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const bucketName = process.env.AWS_BUCKET_NAME || process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
  
  // Caminho do upload: /promoters/name_campanha/valor(arquivo)
  const uploadPath = `promoters/${campanhaName}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uploadPath,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  // Retorna a URL pública (ajuste caso seu bucket não seja público)
  const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadPath}`;
  return { url: s3Url };
}