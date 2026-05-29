import { inject, provide } from 'vue';

export const menuContextKey = Symbol('ElMenuContext');

export function useParentMenuContext() {
	return inject(menuContextKey, null);
}

export function provideMenuContext(context) {
	provide(menuContextKey, context);
}
