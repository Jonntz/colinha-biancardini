import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

/** IPs desta máquina na rede local: permite abrir o `next dev` pelo celular no mesmo Wi-Fi. */
const lanAddresses = Object.values(networkInterfaces())
  .flatMap((interfaces) => interfaces ?? [])
  .filter((net) => net.family === "IPv4" && !net.internal)
  .map((net) => net.address);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // O Next 16 bloqueia origens que não sejam localhost nos assets de desenvolvimento.
  allowedDevOrigins: lanAddresses,
};

export default nextConfig;
