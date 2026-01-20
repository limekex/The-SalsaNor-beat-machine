import { MachineXMLLoader } from '../../engine/machine-xml-loader.service';
import { IMachine } from '../../engine/machine-interfaces';

// Global config for cross-domain widget hosting
let widgetBaseUrl = '';

export function setWidgetBaseUrl(url: string) {
  widgetBaseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getWidgetBaseUrl(): string {
  return widgetBaseUrl;
}

/**
 * Client-side version of loadMachine that uses fetch instead of fs
 * Supports both same-origin and cross-origin loading
 */
export async function loadMachineClient(machineNameOrPath: string): Promise<IMachine> {
  // If it's just a name, construct the full path
  let url = machineNameOrPath.endsWith('.xml')
    ? `/assets/machines/${machineNameOrPath}`
    : `/assets/machines/${machineNameOrPath}.xml`;

  // Prepend base URL if configured (for cross-domain usage)
  if (widgetBaseUrl) {
    url = `${widgetBaseUrl}${url}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load machine from ${url}: ${response.statusText}`);
  }

  const machineXml = await response.text();
  const xml = new DOMParser().parseFromString(machineXml, 'text/xml');
  const loader = new MachineXMLLoader();

  return loader.loadMachine(xml);
}
