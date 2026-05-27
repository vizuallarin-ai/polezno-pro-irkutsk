import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import config from "../../../../payload.config";
import { importMap } from "../importMap";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: Promise.resolve(config) as never, params, searchParams });

export default function Page({ params, searchParams }: Args) {
  return RootPage({ config: Promise.resolve(config) as never, params, searchParams, importMap });
}
