import type { Admin, User } from 'src/database/entities';
import type { FetchResult } from 'src/utils/paginate';

/**
 * IService is a generic interface for services in the application.
 * It provides a standard structure for methods related to fetching, creating, updating, and deleting items.
 *
 * @template T - The type of the query object for pagination.
 * @template P - The type of the query pagination object.
 * @template C - The type of the DTO object for creating an item.
 * @template E - The type of the entity object.
 */
export interface IService<T, P, C, E> {
  /**
   * Fetches items with pagination.
   *
   * @param query - The query object for pagination.
   * @param pagination - The pagination object.
   * @returns A promise that resolves to a FetchResult of the entity.
   */
  getItems?(query?: T, pagination?: P): Promise<FetchResult<E>>;

  /**
   * Fetches items based on the role of the user or admin with optional pagination.
   *
   * @param role - The role of the user or admin to filter the items.
   * @param query - The optional query object for additional filtering.
   * @param pagination - The optional pagination object.
   * @returns A promise that resolves to a FetchResult of the entity.
   */

  getItemsByRole?(
    role: User | Admin,
    query?: T,
    pagination?: P,
  ): Promise<FetchResult<E>>;

  /**
   * Fetches a single item by its ID.
   *
   * @param id - The ID of the item.
   * @returns A promise that resolves to the entity.
   */
  getItem?(id: number): Promise<E>;

  /**
   * Fetches a single item by its ID with role-based authorization.
   *
   * @param role - The role of the user or admin fetching the item.
   * @param id - The ID of the item.
   * @returns A promise that resolves to the entity.
   */
  getItemByRole?(role: User | Admin, id: number): Promise<E>;

  /**
   * Creates a new item.
   *
   * @param dto - The DTO object for creating the item.
   * @param file - The optional file associated with the item.
   * @returns A promise that resolves to the created entity.
   */
  createItem?(dto: C, file?: Express.Multer.File): Promise<E>;

  /**
   * Creates a new item with role-based authorization.
   *
   * @param role - The role of the user or admin creating the item.
   * @param dto - The DTO object for creating the item.
   * @param file - The optional file associated with the item.
   * @returns A promise that resolves to the created entity.
   */
  createItemByRole?(
    role: User | Admin,
    dto: C,
    file?: Express.Multer.File | Express.Multer.File[],
  ): Promise<E>;

  /**
   * Updates an existing item by its ID.
   *
   * @param id - The ID of the item.
   * @param dto - The DTO object for updating the item.
   * @param file - The optional file associated with the item.
   * @returns A promise that resolves to a boolean indicating whether the update was successful.
   */
  updateItem?(id: number, dto: E, file?: Express.Multer.File): Promise<boolean>;

  /**
   * Updates an existing item with role-based authorization.
   *
   * @param role - The role of the user or admin updating the item.
   * @param id - The ID of the item.
   * @param dto - The DTO object for updating the item.
   * @param file - The optional file associated with the item.
   * @returns A promise that resolves to a boolean indicating whether the update was successful.
   */
  updateItemByRole?(
    role: User | Admin,
    id: number,
    dto?: E,
    file?: Express.Multer.File | Express.Multer.File[],
  ): Promise<boolean>;

  /**
   * Deletes an existing item by its ID.
   *
   * @param id - The ID of the item.
   * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
   */
  deleteItem?(id: number): Promise<boolean>;

  /**
   * Deletes an existing item with role-based authorization.
   *
   * @param role - The role of the user or admin deleting the item.
   * @param id - The ID of the item.
   * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
   */
  deleteItemByRole?(role: User | Admin, id: number): Promise<boolean>;
}
