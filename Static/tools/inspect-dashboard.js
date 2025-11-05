const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(process.cwd(), 'Static');
const context = { window: {}, console };
context.window.console = console;
context.window.Weld = { features: {}, render() {}, state: {} };
context.window.window = context.window;
vm.createContext(context);
['data.js','data/state/defaultState.js','state.js','util.js','features/reportTable.js','moduleLoader.js','components/appShell.js','services/stateServices.js','registry.js','main.js','app.js','features/dashboard.js'].forEach(file => {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(code, context);
});
const state = context.window.WeldState.initialState();
const html = context.window.renderDashboard(state);
console.log(html.includes('data-action="approve"'));
const match = html.match(/data-message="(.*?)"/);
console.log(match && match[1]);

