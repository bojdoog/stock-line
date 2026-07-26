import { defineConfig } from '@umijs/max';
import routes from './config/routes';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '投资科学',
  },
  routes,
  npmClient: 'npm',
  history: { type: 'hash' },
  utoopack: {},
});
