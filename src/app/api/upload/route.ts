import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getRespondentByToken } from "@/lib/repo";

// Upload direto do navegador para o Vercel Blob (produção). Aqui só autorizamos o envio.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!clientPayload || !(await getRespondentByToken(clientPayload))) {
          throw new Error("Não autorizado");
        }
        return { addRandomSuffix: true, maximumSizeInBytes: 50 * 1024 * 1024 };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
