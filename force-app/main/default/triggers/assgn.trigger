trigger assgn on Account (after update) {
    List<ContentVersion> addnotes = new List<ContentVersion>();
    for( account a: trigger.new)
    {
      ContentVersion objNote = new ContentVersion();
		objNote.Title = 'Test Note';
		objNote.PathOnClient = objNote.Title + '.txt';
		objNote.VersionData = Blob.valueOf('Account has been Updated');
		objNote.FirstPublishLocationId = a.Id;  //Id
		addnotes.add(objNote);
    }
    if(addnotes.size()>0){
      insert addnotes;
	}
}