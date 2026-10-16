import { lookScript } from "@/lib/look";
import { themeScript } from "@/lib/theme";

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: `${themeScript}\n${lookScript}` }} />;
}
