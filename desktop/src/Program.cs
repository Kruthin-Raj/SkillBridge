using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace SkillBridge
{
    static class Program
    {
        private const string DefaultUrl = "http://localhost:5173?app=desktop";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            try
            {
                string targetUrl = DefaultUrl;

                // Check for custom configuration file
                string configFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "skillbridge.cfg");
                if (File.Exists(configFile))
                {
                    string customUrl = File.ReadAllText(configFile).Trim();
                    if (!string.IsNullOrEmpty(customUrl) && customUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                    {
                        targetUrl = customUrl.Contains("?") ? customUrl + "&app=desktop" : customUrl + "?app=desktop";
                    }
                }

                string edgePath = FindEdgePath();
                if (string.IsNullOrEmpty(edgePath) || !File.Exists(edgePath))
                {
                    // Fallback to default system browser
                    Process.Start(new ProcessStartInfo(targetUrl) { UseShellExecute = true });
                    return;
                }

                // Dedicated isolated desktop session directory in LocalAppData
                string desktopUserData = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "SkillBridge",
                    "User Data"
                );

                try
                {
                    if (!Directory.Exists(desktopUserData))
                    {
                        Directory.CreateDirectory(desktopUserData);
                    }
                }
                catch { }

                // Launch Edge in dedicated standalone desktop app mode
                string args = string.Format(
                    "--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1280,820 --app-id=com.skillbridge.desktop",
                    targetUrl,
                    desktopUserData
                );

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = edgePath,
                    Arguments = args,
                    UseShellExecute = false
                };

                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Unable to start SkillBridge Desktop Application:\n\n" + ex.Message,
                    "SkillBridge Launcher",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private static string FindEdgePath()
        {
            string[] possiblePaths = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe")
            };

            foreach (var path in possiblePaths)
            {
                if (File.Exists(path)) return path;
            }

            return "msedge.exe";
        }
    }
}
