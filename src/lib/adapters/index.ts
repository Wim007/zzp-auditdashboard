import type { ApmAdapter } from './interface'
import { mockAdapter } from './mock'
import { apmAdapter } from './apm'

const adapterType = process.env.DATA_ADAPTER ?? 'mock'

export const adapter: ApmAdapter = adapterType === 'apm' ? apmAdapter : mockAdapter

export type { ApmAdapter }
