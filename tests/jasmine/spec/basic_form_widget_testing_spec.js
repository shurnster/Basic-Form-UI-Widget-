describe('Basic Form Widget', function () {

  var formBasic;

  beforeEach(function () {
    setFixtures('<div id="basicFormWidget"></div>');
    formBasic = $('#basicFormWidget');
  });

  /*
   * Quick test warmup...
   * Make sure everything is set up correctly for widget testing...
   */
   it('should have a basic working widget', function () {
    expect(formBasic.basicForm()).toExist();  //Work successful!
  });

   describe('There should be working form options from the basic form ui widget', function () {

    it('should convert values being passed from the "perColumn" property into class columns', function () {
      formBasic.basicForm({
        itemNames: ['First Name', 'Middle Name', 'Last Name'],
        perColumn: 3
      });

      expect(formBasic.find('div')).toHaveClass('four columns');
    });

    it('set of last row with less columns compared to previous rows with more columns has to be equal of size', function() {

      formBasic.basicForm({
        itemNames: ['First Name', 'Middle Name', 'Last Name', 'Skills', 'City', 'State'],
        perColumn: 4
      });

      expect(formBasic.find('div').last()).toHaveClass('six columns');
    });
  });
 });