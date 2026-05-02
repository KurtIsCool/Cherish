export const queryKeys = {
  partner: {
    all: ['partner'],
    detail: () => [...queryKeys.partner.all, 'detail'],
  },
  memories: {
    all: ['memories'],
    lists: () => [...queryKeys.memories.all, 'list'],
    list: (filters) => [...queryKeys.memories.lists(), { filters }],
    details: () => [...queryKeys.memories.all, 'detail'],
    detail: (id) => [...queryKeys.memories.details(), id],
  },
  vaultItems: {
    all: ['vaultItems'],
    lists: () => [...queryKeys.vaultItems.all, 'list'],
    list: (filters) => [...queryKeys.vaultItems.lists(), { filters }],
    details: () => [...queryKeys.vaultItems.all, 'detail'],
    detail: (id) => [...queryKeys.vaultItems.details(), id],
  },
};
