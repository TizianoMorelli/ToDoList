import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

interface TodoItem {
  id: number;
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
  newTodo: string = '';
  localhost = 'http://localhost:3001/todos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

  addTodo(): void {
    if (this.newTodo.trim()) {
      const newTodoItem: Omit<TodoItem, 'id'> = { todo: this.newTodo.trim() };
      this.addTodoItem(newTodoItem).subscribe(response => {
        this.todos.push(response);
        this.newTodo = '';
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
    });
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
}
