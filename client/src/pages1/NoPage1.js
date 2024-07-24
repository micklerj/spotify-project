import Header from '../components/header';


export default function NoPage() {
  return (
    <div className="error page">
      <Header />
      <div>
        <p>Error 404: page not found</p>
      </div>
    </div>
  );
}