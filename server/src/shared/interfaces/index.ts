export interface IBaseRepository<T, CreateDTO = any, UpdateDTO = any> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Record<string, unknown>): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface IBaseService<T, CreateDTO = any, UpdateDTO = any> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
}
