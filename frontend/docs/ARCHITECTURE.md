# ARCHITECTURE

## Entities
- **User**: Represents a person using the system (admin, director, supplier, storekeeper, foreman, client).
- **Material**: Represents items in the warehouse/inventory (e.g., Cement, Bricks).
- **Inventory/Transaction**: Represents movements of materials (in, out, adjust).
- **Request**: A formal application to purchase or issue materials from stock.
- **Project/Object**: Represents a construction site or client property.

## Roles
Based on the frontend code (`ROLE_LABELS`):
- `admin` (Әкімші): Full system access, approves users, manages employees.
- `director` (Бас Директор): View dashboard, stats, approvals.
- `supplier` (Жеткізуші): Manage incoming supplies, views requests.
- `storekeeper` (Қоймашы): Manages warehouse, processes requests (issue/confirm), does stock movements.
- `foreman` (Жұмыс Жүргізуші): Creates requests for materials, views stock.
- `client` (Қолданушы): Limited view, typically interacts via a client portal to track their project.

## Endpoints

### Auth
- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login
- `POST /auth/logout`: Logout
- `GET /auth/me`: Get current user profile

### Dashboard
- `GET /dashboard/stats`: Returns statistics (lowStockCount, requestsCount, usersCount)

### Materials
- `GET /materials`: List materials with optional filters
- `POST /materials`: Create a new material
- `PUT /materials/:id`: Update an existing material

### Inventory
- `GET /inventory`: List inventory transactions
- `POST /inventory`: Add a transaction (in, out, adjust)
- `POST /inventory/scan`: AI camera endpoint to scan a material image
- `POST /inventory/add-scanned`: Save scanned material

### Requests
- `GET /requests`: List requests
- `GET /requests/:id`: Get request details
- `POST /requests`: Create a new request
- `PATCH /requests/:id/status`: Update request status (workflow state machine)
- `POST /requests/:id/issue`: Issue materials from stock for a request
- `POST /requests/:id/confirm`: Confirm request delivery

### Projects (Objects)
- `GET /projects`: List projects
- `POST /projects`: Create a new project

### Users
- `GET /users`: List users
- `PATCH /users/:id/approve`: Approve a newly registered user (Admin only)

## Web Features / Pages
- **Dashboard**: High-level metrics, alerts, low-stock notifications.
- **Materials (Қойма)**: Material listing, filtering, search. Adding new items.
- **Requests (Заявки)**: Workflow for requesting items, changing statuses, issuing materials.
- **Users**: Admin panel for employee management.
- **Client Portal**: Dedicated view for clients.

## Mobile Features Parity Check (to be done)
- See `PARITY.md` for the mobile mapping of these features.
