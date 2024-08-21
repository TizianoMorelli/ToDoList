import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';

interface TodoItem {
  id: number; // Assicurati che l'id sia sempre presente
  todo: string;
  completed: boolean; // Aggiungi un campo per lo stato di completamento
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todos: TodoItem[] = [];
  filteredTodos: TodoItem[] = [];
  newTodo: string = '';
  localhost = 'http://localhost:3001/todos';
  filter: 'all' | 'active' | 'completed' = 'all'; // Nuova variabile per il filtro

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTodos().subscribe(todos => {
      this.todos = todos;
      this.applyFilter(); // Applica il filtro iniziale
    });
  }

  addTodo(): void {
    if (this.newTodo.trim()) {
      const newTodoItem: Omit<TodoItem, 'id'> = { todo: this.newTodo.trim(), completed: false };
      this.addTodoItem(newTodoItem).subscribe(response => {
        this.todos.push(response);
        this.newTodo = '';
        this.applyFilter(); // Applica il filtro dopo aver aggiunto un todo
      });
    }
  }

  addTodoItem(todo: Omit<TodoItem, 'id'>): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.localhost, todo).pipe(
      catchError(this.handleError<TodoItem>('addTodoItem'))
    );
  }

  removeTodo(id: number): void {
    this.http.delete(`${this.localhost}/${id}`).subscribe(() => {
      this.todos = this.todos.filter(todo => todo.id !== id);
      this.applyFilter(); // Applica il filtro dopo aver rimosso un todo
    });
  }

  toggleTodoCompletion(id: number): void {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.updateTodo(todo).subscribe(() => this.applyFilter()); // Applica il filtro dopo aver aggiornato un todo
    }
  }

  updateTodo(todo: TodoItem): Observable<TodoItem> {
    return this.http.put<TodoItem>(`${this.localhost}/${todo.id}`, todo).pipe(
      catchError(this.handleError<TodoItem>('updateTodo'))
    );
  }

  fetchTodos(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.localhost).pipe(
      catchError(this.handleError<TodoItem[]>('fetchTodos', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  trackById(index: number, todo: TodoItem): number {
    return todo.id;
  }

  // Funzione per applicare il filtro
  applyFilter(): void {
    switch (this.filter) {
      case 'active':
        this.filteredTodos = this.todos.filter(todo => !todo.completed);
        break;
      case 'completed':
        this.filteredTodos = this.todos.filter(todo => todo.completed);
        break;
      case 'all':
      default:
        this.filteredTodos = [...this.todos];
        break;
    }
  }

  // Funzione per cambiare il filtro
  changeFilter(newFilter: 'all' | 'active' | 'completed'): void {
    this.filter = newFilter;
    this.applyFilter();
  }
}

