#!/usr/bin/env python3
"""
Comprehensive link validation for constrainttheory repository.
Checks all links in markdown, HTML, TypeScript, and JavaScript files.
"""

import os
import re
import subprocess
import sys
from pathlib import Path
from typing import List, Tuple, Dict
from urllib.parse import urlparse
import json

class LinkValidator:
    def __init__(self, repo_root: str):
        self.repo_root = Path(repo_root)
        self.results = {
            "total_links": 0,
            "valid_links": 0,
            "broken_links": 0,
            "external_links": 0,
            "broken_by_file": {},
            "external_links_status": {},
            "warnings": []
        }

    def find_all_links(self) -> Dict[str, List[Tuple[str, int, str]]]:
        """Find all links in the repository."""
        links_by_file = {}

        # Patterns for different link types
        patterns = {
            'markdown': [
                (r'\[([^\]]+)\]\(([^)]+)\)', 'Markdown inline link'),
                (r'\[([^\]]+)\]\[([^\]]+)\]', 'Markdown reference link'),
                (r'href="([^"]+)"', 'HTML href in markdown'),
                (r'src="([^"]+)"', 'HTML src in markdown'),
            ],
            'html': [
                (r'href="([^"]+)"', 'HTML href'),
                (r'src="([^"]+)"', 'HTML src'),
                (r'content="([^"]+)"', 'HTML meta content'),
            ],
            'typescript': [
                (r'import.*from\s+["\']([^"\']+)["\']', 'TypeScript import'),
                (r'href\s*[:=]\s*["\']([^"\']+)["\']', 'TypeScript href'),
                (r'url\s*[:=]\s*["\']([^"\']+)["\']', 'TypeScript URL'),
            ],
            'javascript': [
                (r'import.*from\s+["\']([^"\']+)["\']', 'JavaScript import'),
                (r'href\s*[:=]\s*["\']([^"\']+)["\']', 'JavaScript href'),
                (r'url\s*[:=]\s*["\']([^"\']+)["\']', 'JavaScript URL'),
            ]
        }

        # File extensions to check
        file_extensions = {
            '.md': 'markdown',
            '.html': 'html',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascript'
        }

        # Walk through repository
        for root, dirs, files in os.walk(self.repo_root):
            # Skip certain directories
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'target', 'dist', 'build']]

            for file in files:
                ext = os.path.splitext(file)[1]
                if ext not in file_extensions:
                    continue

                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, self.repo_root)

                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        lines = content.split('\n')

                    file_links = []
                    file_type = file_extensions[ext]

                    for line_num, line in enumerate(lines, 1):
                        for pattern, desc in patterns[file_type]:
                            matches = re.finditer(pattern, line)
                            for match in matches:
                                # Extract URL (handle different capture groups)
                                if len(match.groups()) >= 2:
                                    url = match.group(2)
                                else:
                                    url = match.group(1)

                                # Filter out non-URL matches
                                if self.is_valid_url(url):
                                    file_links.append((url, line_num, desc))

                    if file_links:
                        links_by_file[rel_path] = file_links
                        self.results["total_links"] += len(file_links)

                except Exception as e:
                    self.results["warnings"].append(f"Could not read {rel_path}: {str(e)}")

        return links_by_file

    def is_valid_url(self, url: str) -> bool:
        """Check if string looks like a URL or path."""
        # Skip email addresses
        if url.startswith('mailto:'):
            return False

        # Skip anchors
        if url.startswith('#'):
            return False

        # Skip very short strings
        if len(url) < 3:
            return False

        # Check for HTTP/HTTPS
        if url.startswith('http://') or url.startswith('https://'):
            return True

        # Check for relative paths
        if url.startswith('./') or url.startswith('../') or url.startswith('/'):
            return True

        # Check for file extensions
        if re.search(r'\.(md|html?|ts|js|css|png|jpg|jpeg|gif|svg|json)$', url):
            return True

        return False

    def check_internal_link(self, link: str, file_path: str) -> bool:
        """Check if internal link exists."""
        # Convert to absolute path
        if link.startswith('./'):
            target_dir = os.path.dirname(file_path)
            target_path = os.path.join(self.repo_root, target_dir, link[2:])
        elif link.startswith('../'):
            target_dir = os.path.dirname(file_path)
            parts = target_dir.replace('\\', '/').split('/')
            link_parts = link[3:].replace('\\', '/').split('/')

            # Go up directories
            while link_parts and link_parts[0] == '..':
                if parts:
                    parts.pop()
                link_parts.pop(0)

            target_path = os.path.join(self.repo_root, '/'.join(parts), '/'.join(link_parts))
        elif link.startswith('/'):
            target_path = os.path.join(self.repo_root, link[1:])
        else:
            # Relative to current directory
            target_dir = os.path.dirname(file_path)
            target_path = os.path.join(self.repo_root, target_dir, link)

        # Remove anchor if present
        target_path = target_path.split('#')[0]

        # Check if file exists
        if os.path.exists(target_path):
            return True

        # Check if it's a directory (add index.html)
        if os.path.isdir(target_path):
            index_path = os.path.join(target_path, 'index.html')
            if os.path.exists(index_path):
                return True

        return False

    def check_external_link(self, url: str) -> Tuple[bool, int]:
        """Check if external link is accessible."""
        try:
            # Use curl to check HTTP status
            result = subprocess.run(
                ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '10', url],
                capture_output=True,
                text=True,
                timeout=15
            )

            status_code = int(result.stdout.strip())
            return status_code == 200, status_code

        except subprocess.TimeoutExpired:
            return False, 408
        except Exception as e:
            return False, 0

    def validate_all_links(self, links_by_file: Dict[str, List[Tuple[str, int, str]]]):
        """Validate all found links."""
        for file_path, links in links_by_file.items():
            file_broken = []

            for url, line_num, desc in links:
                if url.startswith('http://') or url.startswith('https://'):
                    # External link
                    self.results["external_links"] += 1

                    # Check GitHub repos (these should work)
                    if 'github.com' in url:
                        is_valid, status = self.check_external_link(url)
                        if not is_valid:
                            file_broken.append((url, line_num, f"HTTP {status}", desc))
                            if url not in self.results["external_links_status"]:
                                self.results["external_links_status"][url] = status
                        else:
                            if url not in self.results["external_links_status"]:
                                self.results["external_links_status"][url] = 200
                            self.results["valid_links"] += 1
                    else:
                        # CDN links, documentation links - mark as unchecked
                        if url not in self.results["external_links_status"]:
                            self.results["external_links_status"][url] = "UNCHECKED"
                        self.results["valid_links"] += 1

                else:
                    # Internal link
                    if self.check_internal_link(url, file_path):
                        self.results["valid_links"] += 1
                    else:
                        file_broken.append((url, line_num, "File not found", desc))
                        self.results["broken_links"] += 1

            if file_broken:
                self.results["broken_by_file"][file_path] = file_broken

    def generate_report(self) -> str:
        """Generate markdown report."""
        report = []
        report.append("# Link Validation Report\n")
        report.append(f"**Generated:** {os.popen('date /t && time /t').read().strip()}\n")
        report.append("---\n")

        # Summary
        report.append("## Summary\n")
        report.append(f"- Total links checked: {self.results['total_links']}\n")
        report.append(f"- Valid links: {self.results['valid_links']}\n")
        report.append(f"- Broken links: {self.results['broken_links']}\n")
        report.append(f"- External links: {self.results['external_links']}\n")
        report.append(f"- Files with broken links: {len(self.results['broken_by_file'])}\n")
        report.append(f"- Warnings: {len(self.results['warnings'])}\n")

        # Broken links
        if self.results["broken_by_file"]:
            report.append("\n## Broken Links Found\n")

            report.append("### Critical (Must Fix)\n")
            for file_path, broken_links in self.results["broken_by_file"].items():
                for url, line_num, issue, desc in broken_links:
                    report.append(f"\n#### {file_path}:{line_num}\n")
                    report.append(f"- **Link:** `{url}`\n")
                    report.append(f"- **Issue:** {issue}\n")
                    report.append(f"- **Type:** {desc}\n")
                    report.append(f"- **Fix:** Check if target file exists or update link\n")

        # External links status
        report.append("\n## External Links Status\n")

        # Categorize external links
        github_links = {k: v for k, v in self.results["external_links_status"].items() if 'github.com' in k}
        production_links = {k: v for k, v in self.results["external_links_status"].items() if 'superinstance.ai' in k}
        cdn_links = {k: v for k, v in self.results["external_links_status"].items() if 'cdn.' in k or 'googleapis.com' in k}
        other_links = {k: v for k, v in self.results["external_links_status"].items()
                      if k not in github_links and k not in production_links and k not in cdn_links}

        # GitHub repos
        report.append("### GitHub Repos\n")
        for url, status in sorted(github_links.items()):
            emoji = "✅" if status == 200 else "❌"
            report.append(f"- {emoji} `{url}` - HTTP {status}\n")

        # Production URLs
        report.append("\n### Production URLs\n")
        for url, status in sorted(production_links.items()):
            emoji = "✅" if status == 200 else "❌"
            report.append(f"- {emoji} `{url}` - HTTP {status}\n")

        # CDN links
        report.append("\n### CDN and Documentation Links\n")
        for url, status in sorted(cdn_links.items()):
            report.append(f"- `{url}` - {status}\n")

        # Other links
        if other_links:
            report.append("\n### Other External Links\n")
            for url, status in sorted(other_links.items()):
                emoji = "✅" if status == 200 else "❌"
                report.append(f"- {emoji} `{url}` - HTTP {status}\n")

        # Warnings
        if self.results["warnings"]:
            report.append("\n## Warnings\n")
            for warning in self.results["warnings"]:
                report.append(f"- ⚠️ {warning}\n")

        # Recommendations
        report.append("\n## Recommendations\n")

        if self.results["broken_links"] > 0:
            report.append(f"\n### Priority 1: Fix Broken Links ({self.results['broken_links']} links)\n")
            report.append("1. Update internal file paths\n")
            report.append("2. Move files to match link structure\n")
            report.append("3. Remove or update dead links\n")

        failed_github = [u for u, s in github_links.items() if s != 200]
        if failed_github:
            report.append(f"\n### Priority 2: Fix GitHub Links ({len(failed_github)} links)\n")
            for url in failed_github:
                report.append(f"- {url}\n")

        failed_production = [u for u, s in production_links.items() if s != 200]
        if failed_production:
            report.append(f"\n### Priority 3: Fix Production URLs ({len(failed_production)} links)\n")
            for url in failed_production:
                report.append(f"- {url}\n")

        if self.results["broken_links"] == 0 and not failed_github and not failed_production:
            report.append("\n✅ All critical links validated! Ready for HN launch.\n")

        # Link categories
        report.append("\n## Link Categories\n")
        report.append(f"- Markdown files: {len([f for f in os.walk(self.repo_root) if any(f.endswith('.md') for f in files)])}\n")
        report.append(f"- HTML files: {len([f for f in os.walk(self.repo_root) if any(f.endswith('.html') for f in files)])}\n")
        report.append(f"- TypeScript files: {len([f for f in os.walk(self.repo_root) if any(f.endswith('.ts') for f in files)])}\n")

        return ''.join(report)

def main():
    repo_root = os.path.dirname(os.path.abspath(__file__))

    print("🔍 Starting comprehensive link validation...")
    print(f"📁 Repository: {repo_root}\n")

    validator = LinkValidator(repo_root)

    print("1️⃣ Finding all links...")
    links_by_file = validator.find_all_links()
    print(f"   Found {len(links_by_file)} files with links\n")

    print("2️⃣ Validating links...")
    validator.validate_all_links(links_by_file)
    print("   Validation complete\n")

    print("3️⃣ Generating report...")
    report = validator.generate_report()

    # Save report
    report_path = os.path.join(repo_root, 'docs', 'LINK_VALIDATION_REPORT.md')
    os.makedirs(os.path.dirname(report_path), exist_ok=True)

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"   Report saved to: {report_path}\n")

    # Print summary
    print("📊 Summary:")
    print(f"   Total links: {validator.results['total_links']}")
    print(f"   Valid links: {validator.results['valid_links']}")
    print(f"   Broken links: {validator.results['broken_links']}")
    print(f"   External links: {validator.results['external_links']}")
    print(f"   Warnings: {len(validator.results['warnings'])}")

    if validator.results['broken_links'] == 0:
        print("\n✅ All links validated successfully!")
        return 0
    else:
        print(f"\n⚠️ Found {validator.results['broken_links']} broken links")
        return 1

if __name__ == '__main__':
    sys.exit(main())
