import pool from '../db/pool.js';

export const projectService = {
  async getProjects() {
    const result = await pool.query('SELECT * FROM projects ORDER BY name ASC');
    return result.rows;
  },

  async createProject(data) {
    const { name, location, status = 'active' } = data;
    const result = await pool.query(
      `
        INSERT INTO projects (name, location, status)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [name, location, status]
    );
    return result.rows[0];
  }
};
