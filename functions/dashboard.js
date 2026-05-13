const DASHBOARD_HTML = '<!DOCTYPE html>\n<html lang="en">\n\n<head>\n    <meta charset="UTF-8">\n    <title>Survey Responses Dashboard</title>\n    <style>\n        .dashboard-container {\n            width: 70%;\n            margin-inline: auto;\n            border-radius: 16px;\n            overflow: hidden;\n            border-radius: 16px;\n        }\n\n        .table-responsive {\n            width: 100%;\n            overflow-x: auto;\n            border-radius: 16px;\n        }\n\n        table {\n            border-collapse: collapse;\n            width: 100%;\n            background: #fff;\n            color: black;\n        }\n\n        th,\n        td {\n            border: 1px solid #ccc;\n            padding: 8px 12px;\n            text-align: left;\n        }\n\n        th {\n            background: #f0f0f0;\n        }\n\n        tr:nth-child(even) {\n            background: #f7f7f7;\n        }\n\n        .json-view {\n            font-family: monospace;\n            font-size: 0.95em;\n            white-space: pre-wrap;\n        }\n\n        @media (max-width: 1200px) {\n            .dashboard-container {\n                width: 95%;\n            }\n        }\n    </style>\n    <link rel="stylesheet" href="./style.css">\n</head>\n\n<body>\n    <nav style="display:flex;justify-content:flex-end;gap:1.5rem;margin:0 0 2rem 0;">\n        <a href="/"\n            style="color:#fff;background:#222;padding:0.5em 1.2em;border-radius:8px;text-decoration:none;font-weight:600;">Survey\n            Page</a>\n    </nav>\n\n    <div class="dashboard-container">\n\n        <h1>Survey Responses Dashboard</h1>\n        <div class="table-responsive">\n            <table id="responses-table">\n                <thead>\n                    <tr>\n                        <th>ID</th>\n                        <th>Submitted At</th>\n                        <th>Response Data</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    <tr>\n                        <td colspan="3">Loading...</td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n    </div>\n\n    <script>\n        fetch(\'api/responses\')\n            .then(res => res.json())\n            .then(data => {\n                const tbody = document.querySelector(\'#responses-table tbody\');\n                tbody.innerHTML = \'\';\n                if (data.length === 0) {\n                    tbody.innerHTML = \'<tr><td colspan="3">No responses yet.</td></tr>\';\n                    return;\n                }\n                data.forEach(resp => {\n                    const tr = document.createElement(\'tr\');\n                    tr.innerHTML = `\n                        <td>${resp.id}</td>\n                        <td>${resp.submitted_at}</td>\n                        <td>${formatAnswers(resp.data)}</td>\n                    `;\n                    tbody.appendChild(tr);\n                });\n            });\n\n        function formatAnswers(obj) {\n            if (!obj || typeof obj !== \'object\') return \'\';\n            let html = \'<ul style="margin:0;padding-left:1.2em">\';\n            for (const key in obj) {\n                let val = obj[key];\n                if (Array.isArray(val)) val = val.join(\', \');\n                if (typeof val === \'object\' && val !== null) val = JSON.stringify(val);\n                html += `<li><strong>${key}:</strong> ${val}</li>`;\n            }\n            html += \'</ul>\';\n            return html;\n        }\n    </script>\n</body>\n\n</html>';

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env.SURVEY_ADMIN_PASSWORD)) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Survey Dashboard"' },
    });
  }

  return new Response(DASHBOARD_HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function isAuthorized(request, password) {
  if (!password) return false;
  const auth = request.headers.get('Authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  const decoded = atob(encoded);
  const separator = decoded.indexOf(':');
  const supplied = separator >= 0 ? decoded.slice(separator + 1) : '';
  return supplied === password;
}
