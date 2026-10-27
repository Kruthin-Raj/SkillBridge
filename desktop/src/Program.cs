using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace SkillBridge
{
    static class Program
    {
        private const string ProductionUrl = "https://skill-bridge-khaki-kappa.vercel.app?app=desktop";
        private const string LocalUrl = "http://localhost:5173?app=desktop";

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            try
            {
                string targetUrl = ProductionUrl;

                // Support command-line arguments: e.g. SkillBridge.exe --local or custom URL
                if (args != null && args.Length > 0)
                {
                    string first = args[0].Trim();
                    if (first.Equals("--local", StringComparison.OrdinalIgnoreCase) ||
                        first.Equals("-l", StringComparison.OrdinalIgnoreCase) ||
                        first.Equals("local", StringComparison.OrdinalIgnoreCase))
                    {
                        targetUrl = LocalUrl;
                    }
                    else if (first.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                             first.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                    {
                        targetUrl = first.Contains("?") ? first + "&app=desktop" : first + "?app=desktop";
                    }
                }

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
                string launchArgs = string.Format(
                    "--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1280,820 --app-id=com.skillbridge.desktop",
                    targetUrl,
                    desktopUserData
                );

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = edgePath,
                    Arguments = launchArgs,
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
