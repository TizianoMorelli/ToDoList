import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, Observable, of } from 'rxjs';

interface TodoItem {
  id: string;
  todo: string;
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todos: TodoItem[] = [];
  newTodo: string = "";
  localhost: string = "http://localhost:3001/todo";
  http = inject(HttpClient);

  async ngOnInit(): Promise<void> {
    try {
      this.todos = await this.fetchUsers();
      console.log('Todos fetched:', this.todos); // Log per debugging
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  addTodo() {
    if (this.newTodo.trim()) {
      const newTodoItem: Omit<TodoItem, 'id'> = { todo: this.newTodo.trim() };
      this.addHero(newTodoItem).subscribe({
        next: (response) => {
          this.todos.push(response); // Assicurati che `response` sia di tipo `TodoItem`
          console.log('Todo added successfully:', response);
        },
        error: (err) => {
          console.error('Error adding todo:', err);
        }
      });
      this.newTodo = "";
    }
  }

  addHero(todo: Omit<TodoItem, 'id'>): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.localhost, todo)
      .pipe(
        catchError(this.handleError<TodoItem>('addHero'))
      );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  removeTodo(id: string) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    // Effettua una chiamata HTTP per eliminare il todo dal server
    this.http.delete(`${this.localhost}/${id}`).subscribe({
      next: () => console.log(`Todo with id ${id} deleted successfully`),
      error: (err) => console.error('Error deleting todo:', err)
    });
  }

  async fetchUsers(): Promise<TodoItem[]> {
    try {
      const res: Response = await fetch(this.localhost);
      if (res.ok) {
        const data: TodoItem[] = await res.json();
        console.log('Server response:', data); // Log per debugging

        // Verifica se `data` è un array
        if (Array.isArray(data)) {
          return data; // Restituisci direttamente l'array
        } else {
          console.error('Unexpected response format:', data);
          return [];
        }
      } else {
        console.error('Failed to fetch todos:', res.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  }
}
